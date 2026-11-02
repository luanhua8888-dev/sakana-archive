"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { SakanaButton } from "@/components/sakana-button";

export interface QuizFish { name: string; latin: string; image?: string; trait: string; note: string }
interface Round { answer: number; options: number[]; picked: number | null }

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}

// The first round is fixed so the server and the browser render the same thing.
function firstRound(pool: QuizFish[]): Round {
  const answer = Math.max(0, pool.findIndex(fish => fish.name === "Cá mao tiên"));
  const options = [answer, ...[1, 4, 7].map(step => (answer + step) % pool.length)];
  return { answer, options: [options[2], options[0], options[3], options[1]], picked: null };
}

function nextRound(pool: QuizFish[], previous: number): Round {
  const answer = shuffle(pool.map((_, i) => i).filter(i => i !== previous))[0];
  const others = shuffle(pool.map((_, i) => i).filter(i => i !== answer)).slice(0, 3);
  return { answer, options: shuffle([answer, ...others]), picked: null };
}

// Only the outline is shown; answering lifts the shadow to reveal the plate in colour.
export function SilhouetteQuiz({ fish }: { fish: QuizFish[] }) {
  const pool = fish.filter(item => item.image);
  const [round, setRound] = useState<Round>(() => firstRound(pool));
  const [score, setScore] = useState({ streak: 0, best: 0, answered: 0, right: 0 });
  if (pool.length < 4) return null;
  const target = pool[round.answer], solved = round.picked !== null, correct = round.picked === round.answer;

  const pick = (option: number) => {
    if (solved) return;
    const hit = option === round.answer;
    setRound({ ...round, picked: option });
    setScore(current => {
      const streak = hit ? current.streak + 1 : 0;
      return { streak, best: Math.max(current.best, streak), answered: current.answered + 1, right: current.right + (hit ? 1 : 0) };
    });
  };

  return (
    <section className="quiz paper" id="doan-bong" aria-labelledby="quiz-title">
      <div className="quiz-copy reveal">
        <span className="folio-label">TRÒ CHƠI / ĐOÁN BÓNG CÁ</span>
        <h2 id="quiz-title">Bóng hình này<br /><em>là ai?</em></h2>
        <p>Chỉ nhìn đường viền, bạn có nhận ra cư dân nào trong cuốn thủy tộc chí? Mỗi lần đoán đúng, một bản khắc cổ sẽ hiện nguyên sắc màu.</p>
        <dl className="quiz-score font-mono">
          <div><dt>CHUỖI ĐÚNG</dt><dd>{score.streak}</dd></div>
          <div><dt>KỶ LỤC</dt><dd>{score.best}</dd></div>
          <div><dt>ĐÚNG / ĐÃ ĐOÁN</dt><dd>{score.right}/{score.answered}</dd></div>
        </dl>
      </div>
      <div className="quiz-board reveal">
        <div className={`quiz-plate${solved ? " is-solved" : ""}`}>
          <span className="quiz-plate-label font-mono">PLATE ? / {pool.length}</span>
          <img key={target.image} src={target.image} alt={solved ? target.name : "Bóng một loài cá cần đoán"} draggable="false" />
          {!solved && <span className="quiz-mark" aria-hidden="true">?</span>}
        </div>
        <div className="quiz-options" role="group" aria-label="Chọn tên loài cá">
          {round.options.map(option => {
            const state = !solved ? "" : option === round.answer ? " is-right" : option === round.picked ? " is-wrong" : " is-dim";
            return (
              <button key={option} type="button" className={`quiz-option font-mono${state}`} onClick={() => pick(option)} disabled={solved}>
                <span>{pool[option].name}</span>
                {solved && option === round.answer && <Check size={16} />}
                {solved && option === round.picked && option !== round.answer && <X size={16} />}
              </button>
            );
          })}
        </div>
        <div className="quiz-result" aria-live="polite">
          {solved && <>
            <p className="font-mono"><strong>{correct ? "Chính xác!" : `Đó là ${target.name}.`}</strong> <i>{target.latin}</i></p>
            <p className="font-mono">{target.trait}. {target.note}</p>
            <SakanaButton onClick={() => setRound(nextRound(pool, round.answer))} idPrefix="quiz-next"><span>BÓNG TIẾP THEO</span> <ArrowRight size={15} /></SakanaButton>
          </>}
        </div>
      </div>
    </section>
  );
}
