import React, { useState } from 'react';
import axios from 'axios';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
import { FaUpload, FaCompress, FaDownload } from 'react-icons/fa';

const lightTheme = {
  background: '#f0f0f0',
  text: '#333333',
  subText: '#666666',
  primary: '#4a90e2',
  hover: '#3a80d2',
  shadow: 'rgba(0, 0, 0, 0.1)',
  cardBg: '#ffffff',
  buttonText: '#ffffff',
};

const darkTheme = {
  background: '#1a1a1a',
  text: '#f0f0f0',
  subText: '#cccccc',
  primary: '#61dafb',
  hover: '#51caeb',
  shadow: 'rgba(255, 255, 255, 0.1)',
  cardBg: '#2a2a2a',
  buttonText: '#1a1a1a',
};

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    transition: all 0.3s ease;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled.div`
  background-color: ${props => props.theme.cardBg};
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px ${props => props.theme.shadow};
  max-width: 500px;
  width: 100%;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, ${props => props.theme.primary}, ${props => props.theme.hover});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FileInput = styled.input`
  display: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const StyledButton = styled.button`
  background: linear-gradient(45deg, ${props => props.theme.primary}, ${props => props.theme.hover});
  color: ${props => props.theme.buttonText};
  padding: 12px 24px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px ${props => props.theme.shadow};
  font-weight: bold;
  letter-spacing: 0.5px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  overflow: hidden;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: all 0.6s;
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 8px ${props => props.theme.shadow};

    &:before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 2px 4px ${props => props.theme.shadow};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    font-size: 1.2em;
  }
`;

const FileLabel = styled(StyledButton).attrs({ as: 'label' })`
  background: linear-gradient(45deg, ${props => props.theme.hover}, ${props => props.theme.primary});
  margin-bottom: 1rem;
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(15deg) scale(1.1);
  }
`;

const StatusMessage = styled.p`
  margin-top: 1rem;
  font-style: italic;
  text-align: center;
  animation: ${slideUp} 0.3s ease-out;
  color: ${props => props.theme.subText};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: ${props => props.theme.background};
  border-radius: 5px;
  margin-top: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: ${props => props.theme.primary};
  transition: width 0.3s ease-out;
`;

const CompressionDetails = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${props => props.theme.background};
  border-radius: 5px;
  font-size: 0.9rem;
  color: ${props => props.theme.subText};
  animation: ${fadeIn} 0.5s ease-out;
`;

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [theme, setTheme] = useState('light');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [compressionDetails, setCompressionDetails] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setStatus('');
    setDownloadUrl(null);
    setProgress(0);
    setCompressionDetails(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    setStatus('Compressing...');

    try {
      const response = await axios.post('http://localhost:5000/compress', formData, {
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      
      const originalSize = file.size;
      const compressedSize = response.data.size;
      const reduction = ((originalSize - compressedSize) / originalSize) * 100;

      setCompressionDetails({
        originalSize: formatBytes(originalSize),
        compressedSize: formatBytes(compressedSize),
        reduction: reduction.toFixed(2)
      });

      setStatus('Compression complete! Click the download button to get your file.');
      setProgress(100);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      setStatus('Error compressing PDF. Please try again.');
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `compressed_${file.name}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <AppContainer>
        <ThemeToggle onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </ThemeToggle>
        <Card>
          <Title>PDF Compressor</Title>
          <FileLabel htmlFor="file-upload">
            <FaUpload />
            {file ? file.name : 'Choose PDF file'}
          </FileLabel>
          <FileInput
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />
          <ButtonContainer>
            <StyledButton onClick={handleCompress} disabled={!file}>
              <FaCompress />
              Compress PDF
            </StyledButton>
            {downloadUrl && (
              <StyledButton onClick={handleDownload}>
                <FaDownload />
                Download Compressed PDF
              </StyledButton>
            )}
          </ButtonContainer>
          {status && <StatusMessage>{status}</StatusMessage>}
          {progress > 0 && (
            <ProgressBar>
              <ProgressFill progress={progress} />
            </ProgressBar>
          )}
          {compressionDetails && (
            <CompressionDetails>
              <p>Original size: {compressionDetails.originalSize}</p>
              <p>Compressed size: {compressionDetails.compressedSize}</p>
              <p>Reduction: {compressionDetails.reduction}%</p>
            </CompressionDetails>
          )}
        </Card>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;