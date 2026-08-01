import { Link } from "react-router-dom";
import { db } from "../services/storageService";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

export default function Home() {
  const popularFood = db.getAll("menu").slice(0, 6);
  const reviews = db.getAll("reviews");

  return (
    <div>
      <PublicNavbar />

      <section className="hp-hero">
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="eyebrow mb-3">Est. 2010 · Marine Drive, Mumbai</div>
              <h1 className="display mb-3">
                A Table Held<br /><span className="script">just for you.</span>
              </h1>
              <p className="mb-4" style={{ maxWidth: 480, color: "#cfcbc2" }}>
                Reserve your table in seconds, browse a menu crafted by our chefs,
                and let HotelPro handle the rest — from the first course to the final bill.
              </p>
              <div className="d-flex gap-3">
                <Link to="/booking" className="btn btn-gold btn-lg px-4">Book a Table</Link>
                <Link to="/menu" className="btn btn-outline-gold btn-lg px-4">View Menu</Link>
              </div>
              <hr className="hp-hairline my-4" style={{ maxWidth: 300 }} />
              <div className="d-flex gap-4 small text-white-50">
                <div><strong className="text-white d-block fs-5">12</strong>Tables</div>
                <div><strong className="text-white d-block fs-5">17</strong>Signature Dishes</div>
                <div><strong className="text-white d-block fs-5">4.8★</strong>Guest Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 mt-5">
        <div className="container">
          <div className="row g-4 text-center">
            {[
              { icon: "bi-calendar2-check", title: "Instant Booking", text: "Pick a date, time and party size — see live table availability." },
              { icon: "bi-egg-fried", title: "Chef-Curated Menu", text: "Indian, Chinese, fast food & desserts, plated with intent." },
              { icon: "bi-receipt-cutoff", title: "Transparent Billing", text: "GST, service charge and discounts, itemised on every invoice." },
            ].map((f) => (
              <div className="col-md-4" key={f.title}>
                <i className={`bi ${f.icon} text-gold`} style={{ fontSize: "2rem" }}></i>
                <h5 className="display mt-3">{f.title}</h5>
                <p className="text-muted small">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="hp-section-title">
            <div className="eyebrow">From The Kitchen</div>
            <h2>Popular Right Now</h2>
          </div>
          <div className="row g-4">
            {popularFood.map((food) => (
              <div className="col-6 col-md-4 col-lg-2" key={food.id}>
                <div className="hp-food-card">
                  <div className="thumb">{food.emoji}</div>
                  <div className="body">
                    <div className="fw-semibold small">{food.name}</div>
                    <div className="text-gold small">₹{food.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/menu" className="btn btn-outline-gold">See Full Menu</Link>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="hp-section-title">
            <div className="eyebrow">Guest Voices</div>
            <h2>What Our Diners Say</h2>
          </div>
          <div className="row g-4">
            {reviews.map((r) => (
              <div className="col-md-4" key={r.id}>
                <div className="hp-card h-100">
                  <div className="text-gold mb-2">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </div>
                  <p className="fst-italic small">"{r.comment}"</p>
                  <div className="fw-semibold small mt-3">— {r.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
