import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react';

export default function ImageCarousel({ images, title }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  if (!images || images.length === 0) return null;

  const goTo = (idx) => {
    setCurrent((idx + images.length) % images.length);
  };

  const closeLightbox = () => {
    setIsClosing(true);
    setTimeout(() => {
      setLightbox(false);
      setIsClosing(false);
    }, 200);
  };

  useEffect(() => {
    if (!lightbox) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        goTo(current - 1);
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        goTo(current + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, current, images.length]);

  return (
    <>
      {/* Main Carousel */}
      <div className="carousel" id="image-carousel">
        <div className="carousel-viewport">
          <img
            src={images[current]}
            alt={`${title} - Ảnh ${current + 1}`}
            className="carousel-image"
            onClick={() => setLightbox(true)}
            loading="eager"
          />

          {/* Nav Arrows */}
          {images.length > 1 && (
            <>
              <button
                className="carousel-arrow carousel-arrow-left"
                onClick={() => goTo(current - 1)}
                aria-label="Ảnh trước"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <button
                className="carousel-arrow carousel-arrow-right"
                onClick={() => goTo(current + 1)}
                aria-label="Ảnh tiếp"
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="carousel-counter">
            {current + 1} / {images.length}
          </div>
        </div>

        {/* Dots */}
        {images.length > 1 && (
          <div className="carousel-dots">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`carousel-dot ${idx === current ? 'active' : ''}`}
                onClick={() => goTo(idx)}
                aria-label={`Xem ảnh ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="carousel-thumbnails">
            {images.map((img, idx) => (
              <button
                key={idx}
                className={`carousel-thumb ${idx === current ? 'active' : ''}`}
                onClick={() => goTo(idx)}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && createPortal(
        <div className={`lightbox ${isClosing ? 'is-closing' : ''}`} onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <X size={28} weight="bold" />
          </button>
          <img
            src={images[current]}
            alt={`${title} - Full`}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button
                className="lightbox-arrow lightbox-arrow-left"
                onClick={(e) => { e.stopPropagation(); goTo(current - 1); }}
              >
                <CaretLeft size={28} weight="bold" />
              </button>
              <button
                className="lightbox-arrow lightbox-arrow-right"
                onClick={(e) => { e.stopPropagation(); goTo(current + 1); }}
              >
                <CaretRight size={28} weight="bold" />
              </button>
            </>
          )}
        </div>,
        document.body
      )}

      <style>{`
        .carousel {
          width: 100%;
        }

        .carousel-viewport {
          position: relative;
          aspect-ratio: 16 / 10;
          border-radius: var(--radius-main);
          overflow: hidden;
          background: var(--bg-secondary);
        }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: zoom-in;
          transition: opacity var(--duration-normal) var(--ease-smooth);
        }

        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          border-radius: 50%;
          color: var(--color-text-main);
          box-shadow: var(--shadow-sm);
          opacity: 0;
          transition: all var(--duration-fast) var(--ease-smooth);
          cursor: pointer;
          border: none;
        }

        .carousel-viewport:hover .carousel-arrow {
          opacity: 1;
        }

        .carousel-arrow:hover {
          background: #ffffff;
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-arrow-left {
          left: var(--space-3);
        }

        .carousel-arrow-right {
          right: var(--space-3);
        }

        .carousel-counter {
          position: absolute;
          bottom: var(--space-3);
          right: var(--space-3);
          background: rgba(0, 0, 0, 0.5);
          color: #ffffff;
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          font-family: var(--font-mono);
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: var(--space-3);
        }

        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-border-strong);
          border: none;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .carousel-dot.active {
          background: var(--color-accent);
          width: 20px;
          border-radius: var(--radius-pill);
        }

        .carousel-thumbnails {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-3);
          overflow-x: auto;
          padding-bottom: var(--space-2);
        }

        .carousel-thumb {
          flex-shrink: 0;
          width: 64px;
          height: 48px;
          border-radius: var(--radius-subtle);
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          opacity: 0.6;
          transition: all var(--duration-fast) var(--ease-smooth);
          padding: 0;
          background: none;
        }

        .carousel-thumb.active {
          border-color: var(--color-accent);
          opacity: 1;
        }

        .carousel-thumb:hover {
          opacity: 1;
        }

        .carousel-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Lightbox */
        .lightbox {
          position: fixed;
          inset: 0;
          z-index: var(--z-modal);
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
          cursor: pointer;
          animation: lightboxFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .lightbox.is-closing {
          animation: lightboxFadeOut 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .lightbox-image {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: var(--radius-subtle);
          cursor: default;
          animation: lightboxZoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .lightbox.is-closing .lightbox-image {
          animation: lightboxZoomOut 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes lightboxFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes lightboxZoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes lightboxZoomOut {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.95); opacity: 0; }
        }

        .lightbox-close {
          position: absolute;
          top: var(--space-6);
          right: var(--space-6);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border-radius: 50%;
          color: #ffffff;
          border: none;
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-smooth);
        }

        .lightbox-close:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .lightbox-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border-radius: 50%;
          color: #ffffff;
          border: none;
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-smooth);
        }

        .lightbox-arrow:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .lightbox-arrow-left {
          left: var(--space-6);
        }

        .lightbox-arrow-right {
          right: var(--space-6);
        }
      `}</style>
    </>
  );
}
