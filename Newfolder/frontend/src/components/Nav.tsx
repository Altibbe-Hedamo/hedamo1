const Nav: React.FC = () => {
  return (
    <header className="bg-white shadow p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Hedamo</h1>
        <div>
          <a href="/logout" className="text-red-500">Logout</a>
        </div>
      </div>
    </header>
  );
};

export default Nav;