import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import AppState from 'App/State/AppState';

type AppDispatch = ThunkDispatch<AppState, unknown, AnyAction>;

export default function useAppDispatch() {
  return useDispatch<AppDispatch>();
}
