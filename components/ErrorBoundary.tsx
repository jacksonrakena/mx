class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback: React.ReactNode;
  }>,
  { hasError: boolean; error: any | null }
> {
  constructor(
    props: React.PropsWithChildren<{
      fallback: React.ReactNode;
    }>
  ) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: any, info: any) {}

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
