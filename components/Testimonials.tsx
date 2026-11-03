"use client";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};

const testimonials: Testimonial[] = [
  { quote: "The team mapped the site properly before recommending equipment.", name: "A. Khan", role: "Operations manager", initials: "AK" },
  { quote: "One supplier handled the cameras, network and rack from survey to handover.", name: "S. Ahmed", role: "Facilities lead", initials: "SA" },
  { quote: "The final layout was tidy, labelled and easy for our staff to understand.", name: "M. Raza", role: "IT coordinator", initials: "MR" },
  { quote: "We received a clear equipment list and quote before any work began.", name: "N. Iqbal", role: "Business owner", initials: "NI" },
  { quote: "Their Karachi team stayed responsive after installation and configuration.", name: "F. Tariq", role: "Office administrator", initials: "FT" },
];

function Card({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="testimonial-card">
      <p className="testimonial-quote">“{testimonial.quote}”</p>
      <div className="testimonial-person">
        <span className="testimonial-avatar" aria-hidden="true">{testimonial.initials}</span>
        <span><strong>{testimonial.name}</strong><small>{testimonial.role}</small></span>
      </div>
    </article>
  );
}

function Row({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="testimonial-mask">
      <div className={`testimonial-track${reverse ? " testimonial-track--reverse" : ""}`}>
        <div className="testimonial-copy">
          {testimonials.map((testimonial) => <Card key={testimonial.initials} testimonial={testimonial} />)}
        </div>
        <div className="testimonial-copy" aria-hidden="true">
          {testimonials.map((testimonial) => <Card key={`duplicate-${testimonial.initials}`} testimonial={testimonial} />)}
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="testimonial-section" aria-labelledby="testimonials-heading">
      <div className="testimonial-heading">
        <p className="testimonial-eyebrow">The Zetta Tech experience</p>
        <h2 id="testimonials-heading">Clear planning. Tidy installation. Ongoing support.</h2>
      </div>
      <div className="testimonial-rows">
        <Row />
        <Row reverse />
      </div>
    </section>
  );
}
