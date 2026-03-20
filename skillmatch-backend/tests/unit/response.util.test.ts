import { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } from '../../src/utils/response';

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Response utilities', () => {
  it('sendSuccess returns 200 with success:true', () => {
    const res = mockRes();
    sendSuccess(res, { id: '1' }, 'OK');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'OK' }));
  });

  it('sendCreated returns 201', () => {
    const res = mockRes();
    sendCreated(res, { id: '1' });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('sendError returns correct statusCode and success:false', () => {
    const res = mockRes();
    sendError(res, 'Not found', 404);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('sendNotFound returns 404', () => {
    const res = mockRes();
    sendNotFound(res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('sendBadRequest returns 400 with errors array', () => {
    const res = mockRes();
    sendBadRequest(res, 'Invalid input', [{ field: 'email' }]);
    expect(res.status).toHaveBeenCalledWith(400);
    const call = res.json.mock.calls[0][0];
    expect(call.errors).toHaveLength(1);
  });

  it('sendSuccess includes meta when provided', () => {
    const res = mockRes();
    sendSuccess(res, [], 'List', 200, { total: 42, page: 1 });
    const call = res.json.mock.calls[0][0];
    expect(call.meta.total).toBe(42);
  });
});
