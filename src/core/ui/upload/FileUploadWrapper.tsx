import React, { FC, useRef } from 'react';

interface FileUploadWrapperProps {
  onFileSelected: (file: File) => void;
  allowedTypes: string[];
  children: React.ReactNode;
}

const FileUploadWrapper: FC<FileUploadWrapperProps> = ({ onFileSelected, allowedTypes, children }) => {
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
