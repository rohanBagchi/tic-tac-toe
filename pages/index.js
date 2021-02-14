import { useState } from 'react'
import { firebase } from 'src/initFirebase'
import styles from 'src/styles/Home.module.css'
import { useRouter } from 'next/router'

const db = firebase.database();

const gameBoard = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""]
];

export default function Home() {
  const router = useRouter()
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');

  return (
    <div className={styles.container}>
      <h1>Hello World!</h1>

      <form onSubmit={e => {
        e.preventDefault();

        const gameRef = db.ref("games");
        const newGame = gameRef.push();

        newGame.set({
          player1,
          player2,

          gameBoard,
          firstPlayer: player1,
          currentPlayer: player1
        })

        router.push(`/games/${newGame.key}`)
      }}>
        <fieldset className={styles.playerSelectForm}>
          <legend>
            Please enter player names!
          </legend>

          <label>
            Player 1

            <input
              type="text"
              value={player1}
              onChange={e => setPlayer1(e.target.value)}
            />
          </label>
          
          <label>
            Player 2

            <input
              type="text"
              value={player2}
              onChange={e => setPlayer2(e.target.value)}
            />
          </label>

          <button type="submit">
            Go!
          </button>
        </fieldset>
      </form>
    </div>
  )
}
