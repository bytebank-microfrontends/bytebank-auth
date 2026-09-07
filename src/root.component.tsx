export interface RootProps {
  name?: string;
}

export default function Root(props: RootProps) {
  return <section>{props.name} is mounted!</section>;
}
