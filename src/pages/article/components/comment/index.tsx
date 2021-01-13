import Empty from '@/components/empty';
import SafeArea from '@/components/safe-area';
import { useRequest, useUpdateEffect } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { CommentService } from '@/services';
import { ArticleId } from '@/services/article/index.types';
import { Comment } from '@/services/comment/index.types';
import Button from '@vant/weapp/lib/button';
import Loading from '@vant/weapp/lib/loading';
import Popup from '@vant/weapp/lib/popup';
import * as React from 'react';
import { View, Text, ScrollView, GenericEvent, nextTick } from 'remax/wechat';
import ArticleContext from '../context';
import Headline from '../headline';
import s from './index.less';
import ArticleCommentItem from './item';
import ActionSheet from '@vant/weapp/lib/action-sheet';
import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import Loadable from '@/components/loadable';

const PREVIEW_SIZE = 3;

const ArticleComment: React.FC<{ id: ArticleId }> = ({ id }) => {
  const { comment$ } = React.useContext(ArticleContext);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const reportComment = React.useRef<Comment>();
  const [visible, setVisible] = useSetState({
    comments: false,
    actions: false,
    report: false,
    render: false,
  });
  const { data, error, loading, run, params } = useRequest(
    async (params?) => {
      const { list, pagination } = await CommentService.getList({ ...params, articleId: id });

      setComments(pagination.current === 1 ? list : [...comments, ...list]);

      return {
        total: pagination.total,
        loaded: true,
        completed: pagination.current * pagination.pageSize >= pagination.total,
      };
    },
    {
      cacheKey: `comment_${id}`,
    },
  );

  const { loading: reporting, run: report } = useRequest(CommentService.report, { manual: true });

  const {
    data: reportOptions,
    loading: reportLoading,
    run: getReportOptions,
  } = useRequest(CommentService.getReportOptions, { manual: true });

  useUpdateEffect(() => {
    visible.report && !reportLoading && !reportOptions && getReportOptions();
  }, [visible.report]);

  const reload = () => run({ page: 1 });

  const onScrollToLower = () => {
    if (loading || data?.completed) return;
    const [p = {}] = params || [];
    const page = p.page || 1;
    run({ page: page + 1 });
  };

  const onReport = async (event: GenericEvent) => {
    if (reporting || !reportComment.current) return;
    Toast.loading({ duration: 0 });
    await report({
      type: event.detail.key,
      commentId: reportComment.current.id,
    });
    Toast.success('举报成功');
  };

  comment$?.useSubscription((action) => action === 'reload' && reload());

  let content;
  let extra;

  const renderItem = React.useCallback((comment: Comment) => {
    const { id, name, avatar, content, date } = comment;
    return (
      <ArticleCommentItem
        key={id}
        id={id}
        name={name}
        avatar={avatar}
        content={content}
        date={date}
        onLongPress={() => {
          reportComment.current = comment;
          setVisible({ actions: true });
        }}
      />
    );
  }, []);

  if (data?.loaded) {
    if (data.total > PREVIEW_SIZE) {
      extra = (
        <View
          className={s.more}
          onClick={() => {
            setVisible({ comments: true });
            nextTick(() => setVisible({ render: true }));
          }}
        >
          <Text>{data.total}</Text>条
        </View>
      );
    }
    content = (
      <>
        {comments.length > 0 ? (
          <View className={s.preview}>{comments.slice(0, PREVIEW_SIZE).map(renderItem)}</View>
        ) : (
          <Empty
            image='message'
            description='暂无评论，快来抢沙发吧'
            onClick={() => comment$?.emit('focus')}
            local
          />
        )}
        <Popup
          show={visible.comments}
          bindclose={() => setVisible({ comments: false })}
          position='bottom'
          safeAreaInsetBottom={false}
          round
        >
          <View className={s.comments}>
            <View className={s.title}>
              全部评论<Text>{data.total}</Text>
            </View>
            <View
              className={s.close}
              onClick={() => setVisible({ comments: false })}
              hoverClassName='clickable-opacity'
              hoverStayTime={0}
            />
            <ScrollView className={s.container} onScrollToLower={onScrollToLower} scrollY>
              <View>{visible.render && comments.length > 0 && comments.map(renderItem)}</View>
              <Loadable loading={!data.completed} />

              <SafeArea />
            </ScrollView>
          </View>
        </Popup>
        <ActionSheet
          show={visible.actions}
          description={[reportComment.current?.name, reportComment.current?.content]
            .filter(Boolean)
            .join('：')}
          actions={[{ key: 'report', name: '举报', color: '#FF5040' }]}
          bindselect={() => setVisible({ actions: false, report: true })}
          bindclose={() => setVisible({ actions: false })}
          bindcancel={() => setVisible({ actions: false })}
          cancelText='取消'
        />
        <ActionSheet
          show={visible.report}
          description='举报类型'
          actions={
            reportLoading
              ? [{ loading: true }]
              : reportOptions?.map(({ value, label }) => ({ key: value, name: label }))
          }
          bindselect={onReport}
          bindclose={() => setVisible({ report: false })}
          bindcancel={() => setVisible({ report: false })}
          cancelText='取消'
        />
      </>
    );
  } else if (error && !data?.loaded) {
    content = (
      <Empty
        image='record'
        description={
          <>
            {MESSAGE.REQUEST_FAILED}
            <View>{error.message}</View>
          </>
        }
        local
      >
        <Button
          type='primary'
          size='small'
          bindclick={run}
          loading={loading}
          disabled={loading}
          round
        >
          {MESSAGE.RETRY}
        </Button>
      </Empty>
    );
  } else {
    content = <ArticleCommentItem.Loader size={3} />;
  }

  return (
    <View className={s.wrapper}>
      <Headline title='文章评论' extra={extra} />
      {content}
    </View>
  );
};

export default ArticleComment;
