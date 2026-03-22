import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>🍷 Vino Delights</h3>
          <p>
            Curating the world's finest wines since 2020. From Bordeaux to Napa Valley,
            we bring you exceptional selections for every occasion.
          </p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/shop">All Wines</Link></li>
            <li><Link to="/shop?category=Red">Red Wines</Link></li>
            <li><Link to="/shop?category=White">White Wines</Link></li>
            <li><Link to="/shop?category=Sparkling">Sparkling</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Wine Blog</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Vino Delights. All rights reserved. | Must be 21+ to purchase.</p>
      </div>
    </footer>
  );
}
