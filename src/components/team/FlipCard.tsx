// src/components/team/FlipCard.tsx
import React from 'react'
import styled from 'styled-components'

type Props = {
    name: string
    role: string
    avatarUrl?: string
    accentA?: string
    accentB?: string
    accentC?: string
    iconUrl?: string
    backText?: string   // texto en la cara trasera (default: role)
}

const FlipCard: React.FC<Props> = ({
    name,
    role,
    avatarUrl,
    accentA = '#ffbb66',
    accentB = '#ff8866',
    accentC = '#ff2233',
    iconUrl,
    backText,
}) => {
    return (
        <StyledWrapper $accentA={accentA} $accentB={accentB} $accentC={accentC}>
            <div className="card" role="button" aria-label={`${name}, ${role}`}>
                <div className="content">
                    {/* ---------- FRONT (ahora: ÍCONO) ---------- */}
                    <div className="front">
                        <div className="img" aria-hidden="true">
                            {avatarUrl ? (
                                <div className="avatar" style={{ backgroundImage: `url(${avatarUrl})` }} />
                            ) : (
                                <>
                                    <div className="circle" />
                                    <div className="circle" id="right" />
                                    <div className="circle" id="bottom" />
                                </>
                            )}
                        </div>

                        <div className="front-icon" aria-hidden="true">
                            {iconUrl ? (
                                <img src={iconUrl} alt="" />
                            ) : (
                                // Fallback muy simple (líneas); NO es la pizza
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* ---------- BACK (ahora: TEXTO) ---------- */}
                    <div className="back" aria-hidden="true">
                        {/* halo/borde animado */}
                        <div className="back-content">
                            {/* quitado: icono de pizza/fallback */}
                            <strong>{backText ?? role}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div<{
    $accentA: string
    $accentB: string
    $accentC: string
}>`
  .card { overflow: visible; width: 210px; height: 270px; }

  .content {
    width: 100%; height: 100%;
    transform-style: preserve-3d;
    transition: transform 300ms;
    box-shadow: 0 2px 16px rgba(0,0,0,.18);
    border-radius: 10px;
    position: relative;
  }

  .front, .back {
    background-color: #151515;
    position: absolute; width: 100%; height: 100%;
    backface-visibility: hidden;
    border-radius: 10px; overflow: hidden;
  }

  /* Al hacer hover gira 180° para mostrar la cara trasera (texto) */
  .card:hover .content { transform: rotateY(180deg); }

  /* ---------- ORIENTACIÓN (frente visible por defecto) ---------- */
  .front { /* frente sin rotación: se ve por defecto */ }
  .back  { transform: rotateY(180deg); } /* dorso */

  /* ---------- FRONT (icono + fondo) ---------- */
  .img { position: absolute; inset: 0; }
  .avatar { position: absolute; inset: 0; background-size: cover; background-position: center; filter: brightness(.95); }

  .circle {
    width: 90px; height: 90px; border-radius: 50%;
    background-color: ${p => p.$accentA};
    position: absolute; left: 24px; top: 24px; filter: blur(15px); animation: floating 2600ms infinite linear;
  }
  #bottom { background-color:${p => p.$accentB}; left:48px; top:90px; width:160px; height:160px; animation-delay:-800ms; }
  #right  { background-color:${p => p.$accentC}; left:150px; top:16px; width:40px; height:40px; animation-delay:-1800ms; }
  @keyframes floating { 0%{transform:translateY(0)} 50%{transform:translateY(10px)} 100%{transform:translateY(0)} }

  .front-icon {
    position: absolute; inset: 0;
    display: grid; place-items: center; z-index: 2;
  }
  .front-icon img {
    width: 64px; height: 64px;
    filter: brightness(0) invert(1) contrast(1.05) drop-shadow(0 4px 10px rgba(0,0,0,.45));
    opacity: .98;
  }
  .front-icon svg {
    width: 64px; height: 64px; color: #fff; fill: currentColor; opacity: .98;
    filter: drop-shadow(0 4px 10px rgba(0,0,0,.45));
  }

    /* ---------- BACK (texto) ---------- */
  .back {
    transform: rotateY(180deg);
    position: relative;            /* para que z-index funcione */
  }

  .back::before {
    position: absolute;
    content: '';
    width: 160px;
    height: 160%;
    background: linear-gradient(
      90deg,
      transparent,
      ${p => p.$accentB},
      ${p => p.$accentB},
      ${p => p.$accentB},
      transparent
    );
    animation: rotation_481 5000ms infinite linear;
    z-index: 0;                 
  }

  @keyframes rotation_481 { 0%{transform:rotateZ(0deg)} 100%{transform:rotateZ(360deg)} }

  .back-content {
    position: absolute;
    inset: 0.4rem;
    background-color: #151515;
    border-radius: 8px;
    color: #fff;
    text-align: center;
    padding: 1rem;
    z-index: 1;           
  }

  .back-content strong {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* centrado óptico real */
    width: calc(100% - 2rem);
    max-width: 100%;
    line-height: 1.25;
    display: block;
    /* microajuste opcional:
       transform: translate(-50%, -52%);
    */
  }
`

export default FlipCard
