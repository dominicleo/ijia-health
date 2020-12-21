import * as React from 'react';
import { hideKeyboard, View } from 'remax/wechat';

import SafeArea from '@/components/safe-area';
import Toast from '@/components/toast';
import { useRequest } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { CommentService } from '@/services';
import { ArticleId } from '@/services/article/index.types';
import Button from '@vant/weapp/lib/button';
import Field from '@vant/weapp/lib/field';

import ArticleContext from '../context';
import s from './index.less';

const TRIM_REG = /(^[\n+|\s+])|([\n+|\s+]$)/g;
const CONSECUTIVE_LINE_BREAKS_REG = /\n{2,}/g;

function trim(value: string) {
  let temp: any = value;

  for (const i in temp) {
    TRIM_REG.test(temp) && (temp = temp.replace(TRIM_REG, ''));
    CONSECUTIVE_LINE_BREAKS_REG.test(temp) &&
      (temp = temp.replace(CONSECUTIVE_LINE_BREAKS_REG, '\n'));
  }

  return temp;
}

const ArticleToolbar: React.FC<{ id: ArticleId }> = React.memo((props) => {
  const { comment$ } = React.useContext(ArticleContext);
  const [state, setState] = useSetState({
    value: '',
    focus: false,
    keyboardHeight: 0,
  });

  const { loading, run } = useRequest(CommentService.submit, { manual: true });

  const children = React.useMemo(() => props.children, [props.children]);

  const onFocus = () => {
    setState({ focus: true });
  };

  const onBlur = React.useCallback(() => {
    if (!state.focus) return;
    setState({ focus: false });
    hideKeyboard();
  }, [state.focus]);

  const onClose = () => {
    setState({ focus: false });
  };

  const onConfirm = async () => {
    const content = trim(state.value);
    if (content.length > 500) {
      Toast('评论不能超过500字哦');
      return;
    }

    Toast.loading({ duration: 0 });
    await run({ articleId: props.id, content });
    Toast.success('评论成功');
    comment$?.emit('reload');
    setState({ focus: false, value: '' });
  };

  comment$?.useSubscription((action) => action === 'focus' && onFocus());

  const toolbarStyle: React.CSSProperties = {
    transition: '200ms',
    transform: `translate3d(0, -${state.keyboardHeight}PX, 0)`,
  };

  return (
    <View className={s.toolbar} style={toolbarStyle}>
      {state.focus && <View className={s.overlay} onClick={onClose} />}
      <View className={s.content}>{children}</View>
      <View className={s.form}>
        <View className={s.value}>
          <Field
            type='textarea'
            value={state.value}
            focus={state.focus}
            placeholder='有什么想说的，直接评论吧'
            adjustPosition={false}
            border={false}
            showConfirmBar={false}
            bindinput={(event) => setState({ value: event.detail })}
            bindfocus={onFocus}
            bindblur={onBlur}
            bindkeyboardheightchange={(event) => setState({ keyboardHeight: event.detail.height })}
            disabled={loading}
            holdKeyboard
            autosize
          />
        </View>
        {(state.focus || !!state.value) && (
          <Button
            type='primary'
            customClass={s.submit}
            bindclick={onConfirm}
            size='small'
            loading={loading}
            disabled={!state.value || loading}
            round
            block
          >
            发布
          </Button>
        )}
        {!state.keyboardHeight && <SafeArea />}
      </View>
    </View>
  );
});

export default ArticleToolbar;
