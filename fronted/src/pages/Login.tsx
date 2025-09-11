import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin?: (user: { name: string; email: string }) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    if (email && password) {
      const user = { name: email.split('@')[0], email };
      if (onLogin) onLogin(user);
      // keep navigation for direct access
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#313131] bg-[radial-gradient(rgba(255,255,255,0.171)_2px,transparent_0)] [background-size:30px_30px] animate-[move_4s_linear_infinite]">
      <style>{`
        @keyframes move {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
      `}</style>
      <div className="form-box max-w-[300px] bg-[#f1f7fe] overflow-hidden rounded-2xl text-[#010101]">
        <form
          className="form flex flex-col relative p-8 pt-8 pb-6 gap-4 text-center"
          onSubmit={handleSubmit}
        >
          <span className="title font-bold text-[1.6rem]">Ingresa</span>
          <span className="subtitle text-base text-[#666]">Mejorá tu manejo de billeteras virtuales</span>
          <div className="form-container overflow-hidden rounded-lg bg-white my-4 mb-2 w-full">
            <input
              type="email"
              name="email"
              className="input bg-none border-0 outline-0 h-10 w-full border-b border-[#eee] text-sm px-4 py-2"
              placeholder="Email"
              required
            />
            <input
              type="password"
              name="password"
              className="input bg-none border-0 outline-0 h-10 w-full border-b border-[#eee] text-sm px-4 py-2"
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="bg-[#0e3570] text-white border-0 rounded-full py-2 px-4 text-base font-semibold cursor-pointer transition-colors duration-300 hover:bg-[#005ce6] w-full">Ingresar</button>
          <button type="button" className="button max-w-xs flex items-center justify-center py-2 px-6 text-sm font-bold uppercase rounded-lg border border-black/25 gap-3 bg-white text-[#413f3f] transition-all duration-300 hover:scale-[1.02]">
            <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" className="h-6">
              <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
              <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
              <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path>
              <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
            </svg>
            Continuar con Google
          </button>
        </form>
        <div className="form-section p-4 text-sm bg-[#e0ecfb] shadow-[0_-1px_0_0_rgba(0,0,0,0.08)]">
          <button
            type="button"
            className="font-bold text-[#0066ff] transition-colors duration-300 hover:text-[#005ce6] hover:underline bg-transparent border-0 p-0 m-0 cursor-pointer"
            onClick={() => navigate('/signup')}
          >
            No tienes una cuenta?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
