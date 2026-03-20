import { useEffect } from 'react';

function getDocumentTitle(title) {
  return title ? `${title} - ${window.Readarr.instanceName}` : window.Readarr.instanceName;
}

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = getDocumentTitle(title);

    return () => {
      document.title = window.Readarr.instanceName;
    };
  }, [title]);
}

export default useDocumentTitle;
