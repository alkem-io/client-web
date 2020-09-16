import * as React from "react";
import { ChallengeProfileQuery } from "../../generated/graphql";
import "./styles.css";

interface Props {
  data: ChallengeProfileQuery;
}

const className = "ChallengeProfile";

const ChallengeProfile: React.FC<Props> = ({ data }) => {
  if (!data.challenge) {
    return <div>No challenge available</div>;
  }

  console.log("Challenge data available!");

  return (
    <div className={className}>
      <div className={`${className}__status`}>
        <span>Challenge loading: </span>
        {data.challenge.name ? (
          <span className={`${className}__success`}>Success</span>
        ) : (
          <span className={`${className}__failed`}>Failed</span>
        )}
      </div>
      <p>
        <span className={`${className}__title`}>
          <b>Tagline: </b>
          <i>{data.challenge.context?.tagline}</i>
        </span>
      </p>
      <span className={`${className}__background`}>
        <b>Background: </b>
        <i>{data.challenge.context?.background}</i>
      </span>
      <p>
        <span className={`${className}__vision`}>
          <b>Vision: </b>
          <i>{data.challenge.context?.vision}</i>
        </span>
      </p>
      <p>
        <span className={`${className}__impact`}>
          <b>Impact: </b>
          <i>{data.challenge.context?.impact}</i>
        </span>
      </p>
      <p>
        <span className={`${className}__who`}>
          <b>Who should get engaged?: </b>
          <i>{data.challenge.context?.who}</i>
        </span>
      </p>
      <p>
        <b>References: </b>
        {!!data.challenge.context?.references &&
          data.challenge.context?.references.map(
            (Reference, i) =>
              !!Reference && (
                <li key={i} className={`${className}__item`}>
                  <b>
                    <a href={Reference.uri}>{Reference.name}</a>
                  </b>{" "}
                  - {Reference.description} &nbsp;
                </li>
              )
          )}
      </p>
      <p>
        <b>Tags: </b>
        {!!data.challenge.tags &&
          data.challenge.tags.map(
            (Tag, i) =>
              !!Tag && (
                <li key={i} className={`${className}__item`}>
                  {Tag.name} &nbsp;
                </li>
              )
          )}
      </p>
    </div>
  );
};

export default ChallengeProfile;
