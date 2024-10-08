import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type message = {
  src: string;
  text: string;
  ref?: string | null;
};

export default function Argonk() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<message[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      console.log("Received message from agent:", event.data);

      try {
        const data = JSON.parse(event.data);
        const { response, wiki_title } = data;
        // const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(
        //   wiki_title
        // )}`;
        const wikiUrl = `https://en.wikipedia.org/wiki/${wiki_title.replace(/ /g, "_")}`;

        setMessages((prevMessages) => [
          ...prevMessages,
          { src: "agent", text: response, ref: wikiUrl },
        ]);
      } catch (error) {
        console.error("Failed to parse message data:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const handlePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    setPrompt(textarea.value);
  };

  const handleSendPrompt = () => {
    if (socket && prompt !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { src: "user", text: prompt },
      ]);
      socket.send(prompt);
      setPrompt("");
    }

    console.log("Prompt sent:", prompt);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 m-4 ${
              message.src === "user"
                ? "w-4/5 ml-auto bg-orange-200 rounded-lg"
                : ""
            }`}
          >
            <p className="text-gray-800" style={{ wordWrap: "break-word" }}>
              <ReactMarkdown
                children={message.text}
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: (props) => (
                    <h1 className="text-3xl font-bold" {...props} />
                  ),
                  h2: (props) => (
                    <h2 className="text-2xl font-semibold" {...props} />
                  ),
                  h3: (props) => (
                    <h3 className="text-xl font-medium" {...props} />
                  ),
                  p: (props) => <p className="text-base" {...props} />,
                  ul: (props) => <ul className="list-disc ml-5" {...props} />,
                  ol: (props) => (
                    <ol className="list-decimal ml-5" {...props} />
                  ),
                  // Add other markdown elements as needed
                }}
              />
            </p>
            {message.ref && (
              <div>
                <a
                  href={message.ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm break-words hover:underline"
                >
                  {message.ref}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex-shrink-0 flex items-center m-2">
        <textarea
          rows={1}
          value={prompt}
          onChange={handlePromptChange}
          className="w-full p-2 border-2 border-gray-300 focus:border-orange-300 focus:outline-none resize-none h-auto max-h-36 overflow-y-auto"
          placeholder="Type a message..."
          style={{ height: "auto" }}
        />
        <img
          src="/up-arrow-png-20.png"
          alt="Send prompt"
          className="w-9 h-9 ml-2 cursor-pointer"
          onClick={handleSendPrompt}
        />
      </div>
    </div>
  );
}
