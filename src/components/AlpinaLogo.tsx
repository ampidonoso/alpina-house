import alpinaLogo from "@/assets/alpina-logo.png";

interface AlpinaLogoProps {
  className?: string;
  color?: string;
}

const AlpinaLogo = ({ className = "" }: AlpinaLogoProps) => {
  return (
    <img
      src={alpinaLogo}
      alt="Alpina House"
      className={className}
    />
  );
};

export default AlpinaLogo;