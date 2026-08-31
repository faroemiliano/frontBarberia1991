import BookingUser from "./BookingUser";

interface Props {
  onClose: () => void;
}

export default function Booking({ onClose }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-box booking-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <BookingUser onClose={onClose} />
      </div>
    </div>
  );
}
