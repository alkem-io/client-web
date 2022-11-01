const downloadText = (fileName: string, stringValue: string, fileType: string) => {
  const blob = new Blob([stringValue], { type: fileType });
  const objectUrl = URL.createObjectURL(blob);

  const el = document.createElement('a');
  el.download = fileName;
  el.href = objectUrl;

  const event = new MouseEvent('click');
  el.dispatchEvent(event);
};

export default downloadText;
