import { ReactNode, PropsWithChildren, useRef } from 'react';

type FileUploadWrapperProps = {
  onFileSelected: (file: File) => void;
  allowedTypes: string[];
  children: ReactNode;
};

const FileUploadWrapper = ({ onFileSelected, allowedTypes, children }: PropsWithChildren<FileUploadWrapperProps>) => {
  const ref = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (ref.current) {
      ref.current.value = '';
      ref.current.click();
    }
  };

  return (
    <div onClick={handleClick}>
      {children}
      <input
        ref={ref}
        type="file"
        accept={allowedTypes.join(',')}
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target?.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
    </div>
  );
};

export default FileUploadWrapper;
