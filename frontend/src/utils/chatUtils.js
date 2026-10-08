export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export const exportChat = (messages, title = 'chat-export') => {
  if (!messages || messages.length === 0) return;
  
  const content = messages.map(msg => 
    `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender === 'user' ? 'You' : 'Sereia'}:\n${msg.text}\n`
  ).join('\n---\n\n');
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
