function Header({ role, onCitizenClick, onAdminClick }) {
  return (
    <header>
      <h1>CitySet</h1>
      <p>Citizen Grievance Management System</p>

      <div>
        <button onClick={onCitizenClick}>
          Citizen
        </button>

        <button onClick={onAdminClick}>
          Admin
        </button>
      </div>
    </header>
  );
}

export default Header;