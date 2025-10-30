// src/pages/not-found/NotFound.tsx
/**
 * @file NotFound.tsx
 * @description 404 “TV estática” (basado en el recurso de Uiverse). Centrada y con “404”
 * grande de fondo. Incluye botón para volver al inicio.
 */

import { Link } from 'react-router-dom'
import './NotFound.scss'

export default function NotFound() {
    return (
        <section className="notfound-page">
            <h1 className="sr-only">Página no encontrada</h1>

            <div className="main_wrapper" aria-hidden="true">
                {/* 404 de fondo */}
                <div className="text_404">
                    <div className="text_4041">4</div>
                    <div className="text_4042">0</div>
                    <div className="text_4043">4</div>
                </div>

                {/* TV */}
                <div className="main">
                    <div className="antenna">
                        <div className="antenna_shadow" />
                        <div className="a1" />
                        <div className="a1d" />
                        <div className="a2" />
                        <div className="a2d" />
                        <div className="a_base" />
                    </div>

                    <div className="tv">
                        <svg className="curve_svg" viewBox="0 0 189.929 189.929" aria-hidden="true">
                            <path d="M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13
                C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z"/>
                        </svg>

                        <div className="display_div">
                            <div className="screen_out">
                                <div className="screen_out1">
                                    {/* Estática */}
                                    <div className="screen">
                                        <span className="notfound_text">NOT FOUND</span>
                                    </div>
                                    {/* Barras de color para móviles */}
                                    <div className="screenM">
                                        <span className="notfound_text">NOT FOUND</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lines">
                            <div className="line1" />
                            <div className="line2" />
                            <div className="line3" />
                        </div>

                        <div className="buttons_div" aria-hidden="true">
                            <div className="b1"><div /></div>
                            <div className="b2" />
                            <div className="speakers">
                                <div className="g1">
                                    <div className="g11" />
                                    <div className="g12" />
                                    <div className="g13" />
                                </div>
                                <div className="g" />
                                <div className="g" />
                            </div>
                        </div>
                    </div>

                    <div className="bottom" aria-hidden="true">
                        <div className="base1" />
                        <div className="base2" />
                        <div className="base3" />
                    </div>
                </div>
            </div>

            <div className="cta">
                <Link to="/" className="btn ghost">Volver al inicio</Link>
            </div>
        </section>
    )
}
