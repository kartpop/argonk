import Argonk from "./components/Argonk";
import Knogra from "./components/Knogra";

function App() {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-2/3 bg-orange-300 h-screen p-0.5">
        <Knogra />
      </div>
      <div className="w-1/3 h-screen">
        <Argonk />
      </div>
    </div>
  );
}

export default App;
