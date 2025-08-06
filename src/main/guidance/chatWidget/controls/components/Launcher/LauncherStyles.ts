import { keyframes } from '@mui/material/styles';

// Define keyframes for animations
export const slideIn = keyframes`
  0% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const rotationLr = keyframes`
  0% {
    transform: rotate(-90deg);
  }
  100% {
    transform: rotate(0);
  }
`;

export const rotationRl = keyframes`
  0% {
    transform: rotate(90deg);
  }
  100% {
    transform: rotate(0deg);
  }
`;
