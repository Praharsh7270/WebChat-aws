// audio setup
const keyStrokeSounds = [
  new Audio(`${import.meta.env.BASE_URL}Sounds/keystroke1.mp3`),
  new Audio(`${import.meta.env.BASE_URL}Sounds/keystroke2.mp3`),
  new Audio(`${import.meta.env.BASE_URL}Sounds/keystroke3.mp3`),
  new Audio(`${import.meta.env.BASE_URL}Sounds/keystroke4.mp3`),
];

function useKeyboardSound() {
  const playRandomKeyStrokeSound = () => {
    const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];

    randomSound.currentTime = 0; // this is for a better UX, def add this
    randomSound.play().catch((error) => console.log("Audio play failed:", error));
  };

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;
