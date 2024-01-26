import { Button, ButtonProps } from '@nextui-org/react';

type Props = ButtonProps;

const FormButton = ({ className, ...props }: Props) => (
  <Button
    className={'py-6 w-full ' + className}
    variant={props.variant ?? 'ghost'}
    {...props}
  />
);

export default FormButton;
