export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h4>Dirección</h4>
          <p>Irigoyen 1138, B1752 La Tablada</p>
          <p>Buenos Aires, Argentina</p>
        </div>

        <div className="footer-col">
          <h4>Horarios</h4>

          <p>
            <strong>Martes a Jueves:</strong> 11:00 – 14:00 | 15:00 – 20:00
          </p>

          <p>
            <strong>Viernes y Sábado:</strong> 10:00 – 14:00 | 15:00 – 20:00
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Barbería El Corte · Todos los derechos
        reservados
      </div>
    </footer>
  );
}
