import { useEffect, useState } from 'react'
import { firebase } from 'src/initFirebase'
import styles from 'src/styles/Home.module.css'
import gameStyles from 'src/styles/Game.module.css'

const db = firebase.database()
const gameBoard = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];

export default function Game({ id }) {
    const [game, setGame] = useState(null)
    const currentGameRef = db.ref(`/games/${id}`)

    useEffect(() => {
        currentGameRef.on('value', snapShot => {
            const currentGame = snapShot.val()
            setGame(currentGame)
        })
        return () => {
            currentGameRef.off()
        }
    }, [id])

    if (!game) {
        return (
            <div>
                Loading game...
            </div>
        )
    }

    const renderBoard = () => {
        return game.gameBoard.map((row, rowIdx) => {
            const cols = row.map((col, colIdx) => {
                return (
                    <div
                        role="button"
                        className={gameStyles.col}
                        key={`col-${rowIdx}-${colIdx}`}
                        onClick={() => {
                            if (game.gameBoard[rowIdx][colIdx] !== '') return;

                            const newBoard = [...game.gameBoard]
                            newBoard[rowIdx][colIdx] = game.currentPlayer === game.player1 ? 'X' : 'O';
                            const nextPlayer = game.currentPlayer === game.player1 ? game.player2 : game.player1;

                            currentGameRef.set({
                                ...game,
                                gameBoard: newBoard,
                                currentPlayer: nextPlayer
                            })
                        }}
                    >
                        {col}
                    </div>
                )
            });

            return (
                <div className={gameStyles.row} key={`row-${rowIdx}`}>
                    {cols}
                </div>
            )
        })
    }

    return (
        <div className={styles.container}>
            <h3>
                {game.currentPlayer}'s chance
            </h3>

            {renderBoard()}

            <button
                className={gameStyles.resetBoard}
                onClick={() => {
                    currentGameRef.set({
                        ...game,
                        gameBoard
                    })
                }}
            >
                Reset Board
            </button>
        </div>
    )
}

export const getServerSideProps = async ({ query }) => {
    return { props: { id: query.id } };
};