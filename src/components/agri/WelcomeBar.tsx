interface Props {
  name: string;
  onLogout: () => void;
}

const WelcomeBar = ({ name, onLogout }: Props) => (
  <div className="welcome-bar">
    <i className="fas fa-user-circle text-base" style={{ color: "hsl(85 65% 70%)" }} />
    <span style={{ color: "hsl(80 100% 85%)" }}>{name}</span>
    <span style={{ color: "hsl(95 25% 50%)" }}>|</span>
    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>
      <i className="fas fa-sign-out-alt mr-1" /> Logout
    </a>
  </div>
);

export default WelcomeBar;
