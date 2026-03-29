import './App.css'

const App = () => {
  const out = 'output-2026-03-29T18:05:07.757Z'
  return (
    <>
      <header>
        <img src="header.svg"/>
      </header>
      <main>
        <section id="intro">
          <p>Fat.Rocks is home to the finest most quirkily packaged THCA Diamonds on the interwebz.</p>
          <p>Our skulls are marked with a NFC tag that links them to digital documentation as to their contents.</p>
        </section>
        <section id="for-sale">
          {Array.from({ length: 9 }, (idx) => idx).map((_, idx: number) => (
            <a
              href={`Diamond Skulls/${out}/№${idx + 1}.cover.inlined.svg`}
              key={`skull-№${idx + 1}`}
            >
              <img
                src={`Diamond Skulls/${out}/№${idx + 1}.cover.inlined.svg`}
                alt={`skull-№${idx + 1}`}
              />
            </a>
          ))}
        </section>
      </main>
    </>
  )
}

export default App
