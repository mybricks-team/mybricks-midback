import { getDefaultProjectFiles } from './const';
import { useEffect, useState } from 'react';

interface ProjectFiles {
  '/index.tsx': string;
  '/index.less': string;
  '/package.json': string;
  '/app.jsx': string;
  '/vite.config.js': string;
}

export function useProjectFiles(srcFiles: {
  'index.tsx': string;
  'index.less': string;
}, options: {
  buildTarget: 'page' | 'component';
} = {} as any) {
  const { buildTarget = 'page' } = options;
  const [projectFiles, setProjectFiles] = useState<ProjectFiles>(getDefaultProjectFiles({ buildTarget }));
  const extractDependencies = (code: string) => {
    const importRegex = /import\s+(?:(?:\w+(?:\s*,\s*{[^}]*})?)|(?:{[^}]*}))\s+from\s+['"]([^'"]+)['"]/g;
    const dependencies = new Set<string>();
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      // Check for dependencies starting with '@'
      if (match[1].startsWith('@')) {
        const [scope, packageName] = match[1].split('/');
        dependencies.add(`${scope}/${packageName}`);
      } else {
        const packageName = match[1].split('/')[0];
        if (!packageName.startsWith('.')) {
          dependencies.add(packageName);
        }
      }
    }
    return Array.from(dependencies);
  };

  const updatePackageJson = (newDependencies: string[]) => {
    const packageJson = JSON.parse(getDefaultProjectFiles({ buildTarget })['/package.json']);
    newDependencies.forEach(dep => {
      if (['react', 'react-dom', 'antd'].includes(dep)) {
        return
      }
      if (!packageJson.dependencies[dep]) {
        packageJson.dependencies[dep] = 'latest';
      }
    });
    console.log(`newpackageJson`, packageJson)
    return JSON.stringify(packageJson, null, 2)
  };

  useEffect(() => {
    if (projectFiles['/index.tsx']) {
      const dependencies = extractDependencies(projectFiles['/index.tsx']);
      setProjectFiles(prevFiles => {
        return {
          ...prevFiles,
          '/package.json': updatePackageJson(dependencies)
        }
      });
    }
  }, [projectFiles['/index.tsx']]);

  const updateProjectFilesFromSrc = (srcFiles: {
    'index.tsx': string;
    'index.less': string;
  }) => {
    const files = {
      ...projectFiles,
      '/index.tsx': srcFiles['index.tsx'] || getDefaultProjectFiles({ buildTarget })['/index.tsx'],
      '/index.less': srcFiles['index.less'] || "",
    }
    console.log(`files`, files)
    setProjectFiles(files)
  }

  useEffect(() => {
    updateProjectFilesFromSrc(srcFiles)
  }, [srcFiles])
  return {
    projectFiles,
    updateProjectFilesFromSrc
  };
}
