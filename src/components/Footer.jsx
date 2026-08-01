export default function Footer() {
  return (
    <footer className="hp-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="hp-seal">HP</span>
              <span className="text-white display fs-5">HotelPro</span>
            </div>
            <p className="small mb-0">
              A boutique fine-dining address for guests who notice the details —
              from the linen on the table to the sommelier's pairing.
            </p>
          </div>
          <div className="col-md-2">
            <div className="text-gold small text-uppercase mb-3" style={{ letterSpacing: "0.1em" }}>Explore</div>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><a href="/">Home</a></li>
              <li><a href="/menu">Menu</a></li>
              <li><a href="/booking">Book a Table</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <div className="text-gold small text-uppercase mb-3" style={{ letterSpacing: "0.1em" }}>Hours</div>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li>Mon – Fri: 11:00 AM – 11:30 PM</li>
              <li>Sat – Sun: 10:00 AM – Midnight</li>
            </ul>
          </div>
          <div className="col-md-3">
            <div className="text-gold small text-uppercase mb-3" style={{ letterSpacing: "0.1em" }}>Contact</div>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><i className="bi bi-geo-alt me-2"></i>Marine Drive, Mumbai</li>
              <li><i className="bi bi-telephone me-2"></i>+91 22 4000 1234</li>
              <li><i className="bi bi-envelope me-2"></i>reservations@hotelpro.com</li>
            </ul>
          </div>
        </div>
        <hr className="hp-hairline my-4" />
        <div className="d-flex flex-wrap justify-content-between small">
          <span>© {new Date().getFullYear()} HotelPro. All rights reserved.</span>
          <span>Built for the HotelPro Restaurant ERP portfolio project.</span>
        </div>
      </div>
    </footer>
  );
}
