import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { Input } from '@material-tailwind/react';
import PdfDisplayPage from './PdfDisplayPage';
import './HomePage.css';
import { Typography } from '@material-tailwind/react';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);
  const [pdfCreated, setPdfCreated] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setSelectedPages([]);
      setPdfCreated(false);
    } else {
      setError('file', {
        type: 'manual',
        message: 'Invalid file format. Please upload a PDF.',
      });
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePageSelect = (pageNumber) => {
    setSelectedPages((prevSelectedPages) => {
      if (prevSelectedPages.includes(pageNumber)) {
        return prevSelectedPages.filter((page) => page !== pageNumber);
      } else {
        return [...prevSelectedPages, pageNumber];
      }
    });
  };

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'http://localhost:3001/upload',
        formData
      );

      const selectedPagesData = {
        originalPdf: response.data.filename,
        selectedPages,
      };

      await axios.post('http://localhost:3001/create-pdf', selectedPagesData);
      setModalIsOpen(true);
      setPdfCreated(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleDownload = async () => {
    try {
      const downloadResponse = await axios.post(
        'http://localhost:3001/download-selected',
        {
          originalPdf: file.name,
          selectedPages,
        },
        {
          responseType: 'arraybuffer',
        }
      );

      const blob = new Blob([downloadResponse.data], {
        type: 'application/pdf',
      });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'selectedPagesPdf.pdf';
      link.click();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='m-auto flex flex-col h-screen items-center gap-5 '>
      <Typography variant='h3' className='text-center mt-4'>
        Upload PDF to Modify
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} className='mt-4'>
        <Input
          color='teal'
          className='w-72 mb-4'
          type='file'
          {...register('file')}
          onChange={onFileChange}
        />
        {errors.file && <p>{errors.file.message}</p>}

        {file && (
          <div className='mt-4' id='ResumeContainer'>
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className='PDFDocument'
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div key={`page-container_${index + 1}`}>
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    className={`PDFPage ${index === 0 ? 'PDFPageOne' : ''}`}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                  <hr className='my-2 border-t border-gray-500 w-full' />
                  <div className='flex items-center gap-4'>
                    <label className='block mt-2'>
                      <input
                        type='checkbox'
                        checked={selectedPages.includes(index + 1)}
                        onChange={() => handlePageSelect(index + 1)}
                      />
                      Page {index + 1}
                    </label>
                    <button
                      type='button'
                      onClick={() => handlePageSelect(index + 1)}
                      className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                    >
                      Select Page
                    </button>
                  </div>
                  <hr className='my-4' />
                </div>
              ))}
            </Document>
            <button
              type='submit'
              className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
            >
              Create PDF
            </button>
          </div>
        )}
      </form>

      {pdfCreated && (
        <PdfDisplayPage
          file={file}
          selectedPages={selectedPages}
          handleDownload={handleDownload}
          closeModal={closeModal}
          modalIsOpen={modalIsOpen}
        />
      )}
    </div>
  );
};

export default HomePage;
