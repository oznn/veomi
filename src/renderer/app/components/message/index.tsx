export default function Message({ msg }: { msg: string }) {
  return (
    <span
      style={{
        display: 'block',
        textAlign: 'center',
        padding: '2em 0',
      }}
    >
      {msg}
    </span>
  );
}
