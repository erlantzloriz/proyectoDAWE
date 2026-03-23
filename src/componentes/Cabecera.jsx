export default function Cabecera({ titulo }) {
  return (
    <header className="py-4 border-bottom">
      <h1 className="text-center display-4 fw-bold">{titulo}</h1>
    </header>
  );
}