export interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper = ({ children }: PageWrapperProps) => (
  <div className='flex flex-col items-center justify-center h-screen'>
    {children}
  </div>
);

PageWrapper.displayName = 'PageWrapper';

export default PageWrapper;
