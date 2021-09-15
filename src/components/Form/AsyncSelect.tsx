import {
  FormLabel,
  FormControl,
  FormErrorMessage,
  useTheme,
} from '@chakra-ui/react';
import { Control, Controller, FieldError } from 'react-hook-form';
import { OptionTypeBase, StylesConfig } from 'react-select';
import ReactAsyncSelect, { AsyncProps } from 'react-select/async';

interface ISelectProps extends AsyncProps<OptionTypeBase> {
  control: Control<any>;
  name: string;
  label?: string;
  error?: FieldError;
  loadOptions: any;
}

export const AsyncSelect = ({
  name,
  control,
  loadOptions,
  label,
  error,
  ...rest
}: ISelectProps): JSX.Element => {
  const theme = useTheme();

  const customStyles: StylesConfig<OptionTypeBase, false> = {
    menu: (provided) => ({
      ...provided,
      borderRadius: theme.radii.md,
      padding: 15,
    }),
    control: (provided, state) => {
      let shadow = provided.boxShadow;

      if (state.isFocused || state.menuIsOpen) {
        shadow = `0 0 0 1px ${theme.colors.blue[300]}`;
      } else if (error) {
        shadow = `0 0 0 1px ${theme.colors.red[500]}`;
      }

      let border = provided.borderColor;

      if (state.isFocused || state.menuIsOpen) {
        border = `${theme.colors.blue[300]}`;
      } else if (error) {
        border = `${theme.colors.red[500]}`;
      }

      return {
        ...provided,
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.radii.md,
        borderColor: border,
        boxShadow: shadow,
        height: 48,
        padding: '0 4px',
        ':hover': {
          borderColor: border,
        },
      };
    },
    dropdownIndicator: (provided) => ({
      ...provided,
      color: theme.colors.gray[700],
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      display: 'none',
    }),
    option: (provided, state: { isSelected: boolean }) => ({
      ...provided,
      borderRadius: theme.radii.md,
      color: state.isSelected ? 'white' : theme.colors.gray[700],
      padding: '10px 20px',
      marginBottom: 4,
      cursor: 'pointer',
    }),
  };

  return (
    <FormControl isInvalid={!!error}>
      {!!label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, onBlur } }) => (
          <ReactAsyncSelect
            cacheOptions
            onChange={onChange}
            onBlur={onBlur}
            loadOptions={loadOptions}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
            styles={customStyles}
            isMulti
            placeholder=""
            loadingMessage={() => 'Carregando...'}
            noOptionsMessage={({ inputValue }) =>
              !inputValue ? 'Começe a digitar...' : 'Nenhum encontrado'
            }
            {...rest}
          />
        )}
      />

      {!!error && (
        <FormErrorMessage position="absolute">{error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};