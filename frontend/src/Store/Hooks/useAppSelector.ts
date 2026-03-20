import { useSelector, type TypedUseSelectorHook } from 'react-redux';
import type AppState from 'App/State/AppState';

const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export default useAppSelector;
