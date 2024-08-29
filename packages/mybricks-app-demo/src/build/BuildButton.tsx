import { WebContainer } from '@webcontainer/api';
import { Button } from 'antd';
import React, { useRef, useEffect, useState } from 'react';


export default () => {
  const [isBuilding, setIsBuilding] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const runCommand = async (...command) => {
    const process = await containerRef.current.spawn(...command);
    process.output.pipeTo(new WritableStream({
      write(data) {
        console.log(`${command} output:`, data);
      }
    }));
    const exitCode = await process.exit;
    return exitCode;
  }

  const donwloadFile = async (path) => {
    const bundleContent = await containerRef.current.fs.readFile(path, 'utf-8');

    // Create a Blob with the bundle content
    const blob = new Blob([bundleContent], { type: 'application/javascript' });

    // Create a download link and trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'bundle.js';
    downloadLink.click();

    // Clean up
    URL.revokeObjectURL(downloadLink.href);
    window.close()
  }

  const getProjectFiles = () => {
    const projectFiles = localStorage.getItem('projectFiles')
    return JSON.parse(projectFiles)
  }

  const mount = async () => {
    if (!containerRef.current) {
      let projectFiles = getProjectFiles()
      const container = await WebContainer.boot()
      let newProjectFiles = Object.entries(projectFiles).reduce((acc, [path, content]) => {
        acc[path.replace('/public', '').replace('/', '')] = {
          file: {
            contents: content
          }
        }
        return acc;
      }, {});

      console.log(`newRrojectFiles`, newProjectFiles)
      projectFiles = {
        ...projectFiles,
        //         'build.mjs': {
        //           file: {
        //             contents: `
        // import path from 'path';
        // import fs from 'fs';
        // import webpack from 'webpack';
        // const config = {
        //   entry: './index.js',
        //   output: {
        //     filename: 'bundle.js',
        //   },
        //   resolve: {
        //     extensions: ['.js', '.jsx', '.ts', '.tsx'],
        //   },
        //   module: {
        //     rules: [
        //       {
        //         test: /\.(js|jsx|ts|tsx)$/,
        //         exclude: /node_modules/,
        //         use: {
        //           loader: 'babel-loader',
        //           options: {
        //             presets: [
        //               '@babel/preset-env',
        //               '@babel/preset-react',
        //               '@babel/preset-typescript'
        //             ]
        //           }
        //         }
        //       },
        //       {
        //         test: /\.(less|css)$/,
        //         use: ['style-loader', 'css-loader', 'less-loader'],
        //       },
        //     ],
        //   },
        //   mode: 'production',
        // };

        // webpack(config, (err, stats) => {
        //   let output = '';
        //   if (err || stats.hasErrors()) {
        //     output = err ? err.toString() : stats.toString({
        //       errors: true,
        //       warnings: true
        //     });
        //     fs.writeFileSync('./build_output.log', output);
        //     console.log("output:", output);
        //     process.exit(1);
        //   } else {
        //     output = stats.toString({
        //       chunks: false,
        //       colors: true
        //     });
        //     fs.writeFileSync('./build_output.log', output);
        //     console.log("output:", output);
        //     process.exit(0);
        //   }
        // });
        //       `
        //           }
        //         }
      }
      await container.mount(newProjectFiles);
      containerRef.current = container
    }
  }

  const build = async () => {
    await mount()
    await runCommand('npm', ['install'])
    await runCommand('npm', ['run', 'build'])
    await donwloadFile('./dist/bundle.js')
  }

  const dev = async () => {
    await mount()
    containerRef.current.on('server-ready', (port, url) => {
      console.log('Dev server is ready at:', url);
      iframeRef.current.src = url;
      // 在这里可以将url设置到iframe的src属性上
    });
    await runCommand('npm', ['install'])
    await runCommand('npm', ['run', 'dev'])
  }

  const handleBuild = async () => {
    try {
      setIsBuilding(true);
      await build();
      setIsBuilding(false);
    } catch (e) {
      console.error(e);
      setIsBuilding(false);
    }
  }

  const handleDev = async () => {
    try {
      setIsBuilding(true);
      await dev();
      setIsBuilding(false);
    } catch (e) {
      console.error(e);
      setIsBuilding(false);
    }
  }

  useEffect(() => {
    handleBuild()
  }, [])
  return (
    <>
      <Button type='primary' className='mt-4 ml-4' onClick={handleBuild} disabled={isBuilding}>
        {isBuilding ? 'Building...' : 'Build'}
      </Button>
      {/* <Button type='primary' className='mt-4 ml-4' onClick={handleDev} disabled={isBuilding}>
        {isBuilding ? 'Building...' : 'dev'}
      </Button> */}
    </>
  );
}