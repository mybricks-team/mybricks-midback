import { WebContainer } from '@webcontainer/api';
import { Button } from 'antd';
import React, { useRef, useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { ProjectFilesContext } from '.';
import _debounce from 'lodash/debounce'
let initPromise: Promise<void>
let hasInit = false
export default () => {
  const { projectFiles, updateProjectFilesFromSrc } = useContext(ProjectFilesContext)
  const [isBuilding, setIsBuilding] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const devProcessRef = useRef<any>(null); // 新增：用于存储 dev 进程的引用


  const restartDevServer = async () => {
    console.log('Restarting dev server...');
    if (devProcessRef.current) {
      console.log('Stopping existing dev server...');
      await devProcessRef.current.kill();
    }
    console.log('Starting new dev server...');
    devProcessRef.current = await containerRef.current.spawn('npm', ['run', 'dev']);
    devProcessRef.current.output.pipeTo(new WritableStream({
      write(data) {
        console.log('Dev server output:', data);
      }
    }));
  }

  const containerRef = useRef<WebContainer>(null);
  const runCommand = useCallback(async (...command) => {
    const process = await containerRef.current.spawn(...command);
    process.output.pipeTo(new WritableStream({
      write(data) {
        console.log(`${command} output:`, data);
      }
    }));
    const exitCode = await process.exit;
    return exitCode;
  }, [])

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
  }

  const mount = useCallback(async ({ projectFiles }) => {
    console.log(`mount files`, projectFiles)
    let newProjectFiles = Object.entries(projectFiles).reduce((acc, [path, content]) => {
      acc[path.replace('/public', '').replace('/', '')] = {
        file: {
          contents: content
        }
      }
      return acc;
    }, {});
    if (!containerRef.current) {
      const container = await WebContainer.boot()
      containerRef.current = container
    }
    await containerRef.current.mount(newProjectFiles);
    hasInit = true
  }, [])


  const build = async ({ projectFiles }) => {
    await mount({ projectFiles })
    await runCommand('npm', ['install'])
    await runCommand('npm', ['run', 'build'])
    await donwloadFile('./dist/bundle.js')
  }

  const compareAndUpdate = useMemo(() => {
    return _debounce(async (newFiles) => {
      await Promise.all(['/index.tsx', '/index.less', '/package.json'].map(async (path) => {
        const file = await containerRef.current.fs.readFile(path, 'utf-8')
        if (file !== newFiles[path]) {
          console.log(`update file`, path, newFiles[path])
          await containerRef.current.fs.writeFile(path, newFiles[path])
          if (path.includes('package.json')) {
            await runCommand('npm', ['install'])
          }
        }
      }))
    }, 50)
  }, [runCommand])

  useEffect(() => {
    const init = async () => {
      await mount({ projectFiles })
      containerRef.current!.on('server-ready', (port, url) => {
        console.log('Dev server is ready at:', url);
        if (url !== iframeRef.current.src) {
          iframeRef.current.src = url;
        }
        // 在这里可以将url设置到iframe的src属性上
      });
      await runCommand('npm', ['install'])
      await runCommand('npm', ['run', 'dev'])
    }
    initPromise = init()
  }, [])


  useEffect(() => {
    if (!hasInit) {
      initPromise.then(() => {
        mount({ projectFiles })
      })
    } else {
      compareAndUpdate(projectFiles)
    }
  }, [projectFiles])

  const handleBuild = async () => {
    try {
      setIsBuilding(true);
      await build({ projectFiles });
      setIsBuilding(false);
    } catch (e) {
      console.error(e);
      setIsBuilding(false);
    }
  }

  return (
    <>
      <iframe className='w-full h-[300px] border border-gray-300' ref={iframeRef} allow='cross-origin-isolated' />
      <Button type='primary' className='mt-4 ml-4' onClick={handleBuild} disabled={isBuilding}>
        {isBuilding ? 'Building...' : 'Build'}
      </Button>
    </>
  );
}