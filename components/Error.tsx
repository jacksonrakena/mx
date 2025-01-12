export const Error = ({ error }: { error: Error & { digest?: string } }) => {
  return (
    <div className="h-full flex justify-center items-center content-center">
      <div>
        <div className="text-2xl font-bold">Error</div>
        <div>{error.toString()}</div>
        {error.digest && (
          <div>
            Digest code: <code>{error.digest}</code>
          </div>
        )}
      </div>
    </div>
  );
};
