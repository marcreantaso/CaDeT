import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCareerData } from "../../hooks/useCareerData";
import { useActor } from "../../contexts/ActorContext";
import { chooseNextAction } from "../../utils/nextAction";
export function NextBestAction() {
  const { data, error, retry } = useCareerData();
  const { currentStage } = useActor();
  if (error)
    return (
      <section className="focus-card">
        <p role="alert">{error}</p>
        <button className="btn btn-secondary" onClick={retry}>
          Retry
        </button>
      </section>
    );
  if (!data)
    return (
      <section className="focus-card" role="status">
        Loading your next step…
      </section>
    );
  const action = chooseNextAction(data, currentStage);
  return (
    <section className="focus-card">
      <span className="eyebrow">Next best action · based on your records</span>
      <h2>{action.title}</h2>
      <p>{action.reason}</p>
      <Link className="btn btn-primary" to={action.href}>
        {action.label}
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
