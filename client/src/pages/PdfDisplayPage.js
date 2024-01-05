import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Modal from 'react-modal';
import { Button } from '@material-tailwind/react';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfDisplayPage = ({
  file,
  selectedPages,
  handleDownload,
  closeModal,
  modalIsOpen,
}) => {
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel='Selected Pages PDF Modal'
    >
      <div className='absolute top-0 right-0 p-4'>
        <Button color='red' type='button' onClick={closeModal}>
          Close
        </Button>
      </div>
      <div>
        <h3>Selected Pages PDF</h3>

        <Document file={file} className={'flex flex-col items-center '}>
          {selectedPages.map((pageNumber) => (
            <Page
              key={`selected_page_${pageNumber}`}
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          ))}
        </Document>
        <div>
          <Button color='green' type='button' onClick={handleDownload}>
            Download Selected Pages PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PdfDisplayPage;
