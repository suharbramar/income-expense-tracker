type HeaderProps = {
  name: string;
};

const Header = ({ name }: HeaderProps) => {
  return (
    <div className="header">
      <h1>{name}</h1>
    </div>
  );
};

export default Header;
