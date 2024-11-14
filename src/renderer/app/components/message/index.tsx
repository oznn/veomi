export default function Message({ msg }: { msg: string }) {
  return (
    <span
      style={{
        display: 'block',
        textAlign: 'center',
        paddingTop: '2em',
      }}
    >
      {msg}
    </span>
  );
}
