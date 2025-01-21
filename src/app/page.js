import React from "react";
import "./globals.css";

export default function HomePage() {
  return (
    <div>
      <header>
        <h1>Bike Rental</h1>
        <nav>
          <ul>
            <li>
              <a href="/auth/login">Home</a>
            </li>
            <li>
              <a href="/auth/login">About</a>
            </li>
            <li>
              <a href="/auth/login">Services</a>
            </li>
            <li>
              <a href="/auth/login">Contact</a>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-text">
            <h2>Bike Rental Application</h2>
            <p>
              The easiest way to rent bikes for your adventures. Quick, simple,
              and reliable!
            </p>
            <a href="/auth/login">Get Started</a>
          </div>
          <div className="hero-image">
            <img
              src="/images/homepage.jpg"
              alt="Bike rental illustration"
            />
          </div>
        </section>
        <section className="features">
          <h3>Why Choose Us?</h3>
          <ul>
            <li>
              <img
                src="/images/affordable.jpg"
                alt="Feature 1"
              />
              <p>Affordable Pricing</p>
            </li>
            <hr />
            <li>
              <img
                src="/images/wide.jpg"
                alt="Feature 2"
              />
              <p>Wide Variety of Bikes</p>
            </li>
            <hr />
            <li>
              <img
                src="/images/booking.png"
                alt="Feature 3"
              />
              <p>Easy Booking Process</p>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
