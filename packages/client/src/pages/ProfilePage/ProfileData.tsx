import ProfileCard from 'src/layout/ProfileCard/ProfileCard'

/**
 * Renders information about the user obtained from MS Graph
 * @param props
 */
export const ProfileData = (props) => {
  return (
    <ProfileCard
      name={props.graphData.firstName}
      email={props.graphData.email}
      id={props.graphData.id}
      displayName={props.graphData.nickName}
    ></ProfileCard>
  )
}
