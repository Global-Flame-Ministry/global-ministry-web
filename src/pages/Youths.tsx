import React from "react";

// --- TYPES ---
type ImageItem = {
  id: number;
  src: string;
  alt: string;
};

type VideoItem = {
  id: number;
  src: string;
  title: string;
};

// --- DATA ---
const IMAGES: ImageItem[] = [
  { id: 1, src: "/images/youth1.jpg", alt: "Youth Event 1" },
  { id: 2, src: "/images/youth2.jpg", alt: "Youth Event 2" },
  { id: 3, src: "/images/youth3.jpg", alt: "Youth Event 3" },
];

const VIDEOCLIPS: VideoItem[] = [
  { id: 1, src: "/videos/clip1.mp4", title: "Highlights 1" },
  { id: 2, src: "/videos/clip2.mp4", title: "Highlights 2" },
];

// --- COMPONENT ---
const Youth: React.FC = () => {
  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "1200px", 
      margin: "0 auto", 
      fontFamily: "sans-serif" 
    }}>
      
      {/* HEADER */}
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#333" }}>Youth Page</h1>
        <p style={{ fontSize: "1.1rem", color: "#666" }}>
          Welcome to our youth community hub 🎉
        </p>
      </header>

      {/* IMAGES SECTION */}
      <section style={{ marginBottom: "60px" }}>
        <h2 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>Gallery</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginTop: "20px"
          }}
        >
          {IMAGES.map((img) => (
            <div key={img.id} style={{ overflow: "hidden", borderRadius: "12px" }}>
              <img
                src={img.src}
                alt={img.alt}
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                  display: "block"
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section>
        <h2 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>Short Clips</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "25px",
            marginTop: "20px"
          }}
        >
          {VIDEOCLIPS.map((video) => (
            <div key={video.id}>
              <video
                controls
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                }}
              >
                <source src={video.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p style={{ 
                marginTop: "10px", 
                fontWeight: "600", 
                textAlign: "center",
                color: "#444" 
              }}>
                {video.title}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Youth;