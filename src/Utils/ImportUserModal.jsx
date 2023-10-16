import React, { useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import { BiPaste, BiXCircle } from "react-icons/bi";
import "../Components/Styles/ImportUserModal.css";
const ImportUserModal = ({ isPasteModelShow, setIsPasteCancel }) => {
  const modalRef = useRef(null);
  useEffect(() => {
    let element = modalRef.current;
  }, []);

  return (
    <div ref={modalRef} id="unique">
      <Modal
        id="unique"
        className="importUserModal"
        size="lg"
        show={isPasteModelShow}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <div className="text-end">
            <BiXCircle
              className="fs-1"
              style={{ opacity: "0.5" }}
              onClick={() => {
                setIsPasteCancel(true);
              }}
            />
            {/* <BiX className="fs-1"/> */}
          </div>
          <div className="text-center" style={{ padding: "110px" }}>
            <sapn
              className="rounded-circle bg-secondary"
              style={{
                width: "85px",
                display: "inline-block",
                height: "85px",
                lineHeight: "85px",
                color: "#0f0b0b",
                cursor: "pointer",
              }}
            >
              <BiPaste className="fs-1" />
            </sapn>
            <p className="pt-2">Click on the paste icon (or) Ctrl+V</p>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ImportUserModal;
