import ProfileCard from 'src/layout/ProfileCard/ProfileCard'

/**
 * Renders information about the user obtained from MS Graph
 * @param props
 */
export const ProfileData = (props) => {
  return (
    <ProfileCard
      name={props.graphData.givenName}
      email={props.graphData.userPrincipalName}
      id={props.graphData.id}
      displayName={props.graphData.displayName}
    ></ProfileCard>
  )
}
